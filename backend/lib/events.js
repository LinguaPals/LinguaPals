import { EventEmitter } from "events";
const bus = new EventEmitter();
export const emit = (event, payload) => bus.emit(event, payload);
export const on = (event, handler) => bus.on(event, handler);
export default { emit, on };
