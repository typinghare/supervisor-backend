import { HttpException } from '@nestjs/common';
import { Environment } from './enum';

export interface Response<D = undefined> {
    message: string;
    data?: D;
}

export default class ResponsePacket<D = undefined> {
    /**
     * Wrapped message.
     * @protected
     */
    protected _message: string;

    /**
     * Wrapped data.
     * @protected
     */
    protected _data: any;

    /**
     * Wrapped error.
     * @protected
     */
    protected _error: Error;

    /**
     * Constructor.
     * @param message
     */
    public constructor(message?: string) {
        this.message(message);
    }

    /**
     * Convert to an object.
     */
    public toObject(): Response<D> {
        return {
            message: this._message,
            data: this._data,
        };
    }

    /**
     * Wrap a piece of message.
     * @param message
     */
    public message(message: string): this {
        this._message = message;
        return this;
    }

    /**
     * Wrap data.
     * @param data
     */
    public data<D>(data: D): this {
        this._data = data;
        return this;
    }

    /**
     * Handle an Error.
     * If it is an HTTP exception (HttpException), then throw it instantly.
     * Else, wrap the error.
     * @param error
     */
    public handle(error: Error): this {
        this._error = error;

        if (error instanceof HttpException) {
            error.message = this._message;
            throw error;
        }

        if (parseInt(process.env.ENVIRONMENT) in [Environment.DEVELOPMENT, Environment.TEST]) {
            console.error(error);
        }

        return this;
    }

    public getError(): Error {
        return this._error;
    }
}