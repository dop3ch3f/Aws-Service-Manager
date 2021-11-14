import AWS from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';
import logsModel, {InstanceStateName, Log} from "@models/logs.model";

// Load credentials from env file
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// create the script to pull the docker-dash image
const UserData = `
                #! /bin/sh
                yum update -y
                amazon-linux-extras install docker
                service docker start
                usermod -a -G docker ec2-user
                chkconfig docker on
                docker run -d -p 8050:8050 public.ecr.aws/h2y1w5h7/docker-dash`;
const UserData64 = `IyEgL2Jpbi9zaAp5dW0gdXBkYXRlIC15CmFtYXpvbi1saW51eC1leHRyYXMgaW5zdGFsbCBkb2NrZXIKc2VydmljZSBkb2NrZXIgc3RhcnQKdXNlcm1vZCAtYSAtRyBkb2NrZXIgZWMyLXVzZXIKY2hrY29uZmlnIGRvY2tlciBvbgpkb2NrZXIgcnVuIC1kIC1wIDgwNTA6ODA1MCBwdWJsaWMuZWNyLmF3cy9oMnkxdzVoNy9kb2NrZXItZGFzaA==`;


export default class IndexService {

    // start a service with aws and store the data
    public async start(service_id?: string): Promise<Partial<Log>> {

        if (!service_id) {
            // create a new instance
            const instances = await ec2.runInstances({
                // read the ami from env file can be adapted to receive from request
                ImageId: process.env.AWS_AMI_ID,
                // set the instance type you want it to run in
                InstanceType: 't2.micro',
                // assign it to a subnet with automatic public ip addressing so as to receive public urls
                SubnetId: process.env.AWS_SUBNET_ID,
                // assign it to a subgroup that gives it all the port access you need
                SecurityGroupIds:[process.env.AWS_SECURITY_GROUP_ID],
                MinCount: 1,
                MaxCount: 1,
                // you can append a base64 encrypted script to run on init of your ami just in case it is not already prebuilt with all you need
                UserData: Buffer.from(UserData).toString('base64'),

            }).promise();

            const instance = instances.Instances[0];

            // sleep for 30 secs as it takes a while to fully start an instance in aws
            // TODO: find a more optimal way to await the start of an instance
            await sleep(30000);

            // create elastic ip allocation
            const allocation = await ec2.allocateAddress({Domain: 'vpc'}).promise();
            // associate elastic ip to instance
            await ec2.associateAddress({
                AllocationId: allocation.AllocationId,
                InstanceId: instance.InstanceId
            }).promise();

            // create the log entry
            const log = new logsModel();

            log.url = allocation.PublicIp;
            log.start_time = instance.LaunchTime;
            log.container_id = instance.InstanceId;
            // keep the remaining information for reference purposes
            log.meta = {...instance, UserData};
            log.stop_time = null;
            log.status = InstanceStateName.Running;

            await log.save();

            return log;
        }

        // start a stopped instance

        const instances = await ec2.startInstances({
            InstanceIds: [service_id],
        }).promise();

        const instance = instances.StartingInstances[0];

        if (instance.PreviousState.Name === InstanceStateName.Running) {
            throw new Error(`Instance ${service_id} is currently ${instance.PreviousState.Name}`)
        }

        const log = await logsModel.findOne({container_id: service_id});

        log.start_time = new Date();
        log.status = InstanceStateName.Running;
        log.stop_time = null;

        await log.save();

        return log;
    }

    // stop a started service with aws
    public async stop(service_id:string): Promise<Partial<Log>> {
        // stop an instance
        const instances = await ec2.stopInstances({
            InstanceIds: [service_id],
        }).promise();

        const instance = instances.StoppingInstances[0];

        if (instance.PreviousState.Name === InstanceStateName.Stopped ||
            instance.PreviousState.Name === InstanceStateName.ShuttingDown ||
            instance.PreviousState.Name === InstanceStateName.Terminated ||
            instance.PreviousState.Name === InstanceStateName.Stopping) {
            throw new Error(`Instance ${service_id} is currently ${instance.PreviousState.Name}`)
        }

        const log = await logsModel.findOne({container_id: service_id});

        log.stop_time = new Date();
        log.status = InstanceStateName.Stopped;

        await log.save();

        return log;
    }

    // get the status of a service
    public async status(service_id: string): Promise<Partial<Log>> {
        return logsModel.findOne({container_id: service_id});
    }
}