import axios from "axios"
import {ToastServiceMethods} from "primevue/toastservice";

let toast: ToastServiceMethods

export const configureAxios = (toastInstance: ToastServiceMethods) => {
    toast = toastInstance
    axios.defaults.baseURL = "http://localhost:3000"
    axios.defaults.headers.common["Content-Type"] = "application/json"

    axios.interceptors.response.use(
        response => response,
        error => handleAxiosError(error)
    )
}

export const setAxiosAuthHeader = (token: string) => {
    axios.defaults.headers.common["Authorization"] = token
        ? `Bearer ${token}`
        : ""
}

function handleAxiosError(error: any) {
    if (axios.isAxiosError(error) && error.response) {
        let errorMessage = error.response?.data?.message

        if (Array.isArray(errorMessage)) {
            errorMessage = errorMessage.map((err) => err.message).join(" ")
        } else if (!errorMessage) {
            errorMessage = "Something went wrong"
        }

        console.error(`Error ${error.response.status}: ${errorMessage}`)
        toast.add({
            severity: 'error',
            summary: 'Something went wrong',
            detail: errorMessage,
            life: 3000,
            closable: true
        })
    } else if (error.request) {
        console.error("No response received:", error.request)
        toast.add({
            severity: 'error',
            summary: 'Something went wrong',
            detail: "No response received from the server.",
            life: 3000,
            closable: true
        })
    } else {
        console.error("Request setup error:", error.message)
        toast.add({
            severity: 'error',
            summary: 'Something went wrong',
            detail: "An unknown error occurred.",
            life: 3000,
            closable: true
        })

    }
    return Promise.reject(error)
}