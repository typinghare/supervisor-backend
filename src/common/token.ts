export const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenContainerInterface {
    string?: null | string,
    payload?: {
        userId: number,
        iat: number
    },
}


export const tokenContainer: TokenContainerInterface = {};