export function getTimeLeftFromUnix(deadlineSec: number) {
    const nowSec = Math.floor(Date.now() / 1000);

    const diffSec = Math.max(deadlineSec - nowSec, 0);

    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);

    return {
        diffSec,
        days,
        hours,
        minutes,
        isExpired: diffSec === 0,
    };
}
