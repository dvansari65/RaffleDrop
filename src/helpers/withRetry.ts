import {isRetryableError} from "./isRetryableError"

export async function withRetry <T>(
    fn:()=> Promise<T>,
    {
        delaysMS=800,
        retries=3,
        backoff=1.5
    } = {}
):Promise<T>{
    let attempt = 0;
    let lastError:any;
    while (attempt < retries) {
        try {
            return await fn()
        } catch (error) {
            lastError = error;
            if(!isRetryableError(lastError)){
                console.log("error is not retryable:",error)
                throw error
            }
            attempt ++;
            if(attempt > retries) break;
            const wait = delaysMS*Math.pow(backoff,attempt - 1);
            console.warn(`🔁 Retry ${attempt}/${retries} in ${wait}ms...`);
            await new Promise(res => setTimeout(res, wait));
        }
    }
    throw lastError;
}