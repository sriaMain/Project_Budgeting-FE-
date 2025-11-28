
import type { FormErrors } from "../types";



 export const parseApiErrors =(err:any): FormErrors =>  {
const newErrors: FormErrors = {};
console.error("Login error:", err);
      // Helper to extract error data from various possible structures (Axios, etc)
      const getErrorData = (error: any) => {
        // Standard Axios Error structure (err.response.data.error)
        if (error?.response?.data?.error) return error.response.data.error;
        // Response object directly thrown (err.data.error)
        if (error?.data?.error) return error.data.error;
        return null;
      };

      const apiErrors = getErrorData(err);

      if (apiErrors) {
         const errorList = Array.isArray(apiErrors) ? apiErrors : [apiErrors];
         // Join all errors into a single string for the general error field
         // This ensures all errors are displayed at the top, regardless of content
         newErrors.general = errorList.join(', ');
      } else {
         // Fallback for standard Error objects or unhandled cases
         newErrors.general = err instanceof Error ? err.message : 'An unexpected error occurred';
      }
return newErrors;

}