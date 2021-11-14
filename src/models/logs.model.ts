import {Document, model, Schema} from "mongoose";

export interface Log {
    container_id: string;
    start_time: string | Date;
    stop_time: string | Date;
    url: string;
    meta: Record<string, any>;
    status: InstanceStateName;
}

export enum InstanceStateName {
    // Pending ="pending",
    Running="running",
    ShuttingDown="shutting-down",
    Terminated="terminated",
    Stopping="stopping",
    Stopped="stopped"
}

const logsSchema: Schema = new Schema({
    container_id: {
        type: String,
    },
    start_time: {
        type: Date,
        default: new Date(),
    },
    stop_time: {
        type: Date,
    },
    url: {
        type: String,
    },
    status: {
        type: String,
    },
    meta: {
        type: Object,
    }
});

const logsModel = model<Log & Document>('Log', logsSchema);

export default logsModel;