export const json = (body: Record<string, unknown>, status = 200) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const text = (body: string, status = 200) => {
    return new Response(body, {
        status,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
};
