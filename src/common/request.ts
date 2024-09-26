import { Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

const axiosStatus = (error: AxiosError) => error.status || error.code;

const axiosErrorResponse = (error: AxiosError) =>
    error.response?.data || error.message;

const exponentialDelay = (
    retryNumber: number,
    retryConfig: AxiosRetryConfig,
): Promise<void> => {
    const delay = 2 ** retryNumber * retryConfig.delay;
    const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
    const totalDelay = delay + randomSum;

    return new Promise((resolve) => setTimeout(resolve, totalDelay));
};

export const makeRequest = async (
    requestConfig: AxiosRequestConfig,
    retryConfig: AxiosRetryConfig,
    logger: Logger,
) => {
    for (let count = 1; count <= retryConfig.count; count++) {
        try {
            const response = await axios.request(requestConfig);

            logger.verbose(
                `Request to Provider succeeded:\nRequest:\n${JSON.stringify(
                    requestConfig,
                    null,
                    2,
                )}\nResponse:\n${JSON.stringify(response.data, null, 2)}`,
            );

            return response.data;
        } catch (error) {
            if (!isNetworkError(error)) throw error;

            if (count === retryConfig.count) {
                logger.error(
                    `Request to Provider failed! after ${count} number of retries\n` +
                        `Status code ${axiosStatus(error)}\n` +
                        `Response:${JSON.stringify(axiosErrorResponse(error))}`,
                );
                throw error;
            }

            if (error instanceof AxiosError) {
                logger.error(
                    `Retrying Request to Provider with retry count: ${count}\n` +
                        `Status code: ${axiosStatus(error)}\n` +
                        `Request:${JSON.stringify(requestConfig)}`,
                );

                await exponentialDelay(count, retryConfig);

                continue;
            }

            if (error instanceof AggregateError) {
                logger.error(
                    `Aggregate Error encountered: ${error.message}`,
                    error.stack,
                );

                for (const cause of error.errors) {
                    logger.error(`Cause: ${cause.message}`, cause.stack);
                }

                throw error;
            }

            logger.error(`unknown error encountered ${error}`);
            throw error;
        }
    }
};

export const isNetworkError = (error) => {
    return !(
        error.response ||
        !error.code ||
        ['ERR_CANCELED', 'ECONNABORTED'].includes(error.code)
    );
};

export interface AxiosRetryConfig {
    count: number;
    delay: number;
}
