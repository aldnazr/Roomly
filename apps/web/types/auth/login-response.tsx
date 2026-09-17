export type LoginResponse = {
    data: {
        accessToken: string
        expiresIn: number
        user: { id: number; name: string; email: string; role: string }
    }
}