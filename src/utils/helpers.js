export const getAuthHeader = () => ({ headers: { authorization: localStorage.getItem('user') }});

export const getWindowSize = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}