export const readApiResponse = async <T extends object>(response: Response): Promise<T & { message?: string }> => {
  const text = await response.text()
  if (!text) return {} as T & { message?: string }
  try {
    return JSON.parse(text) as T & { message?: string }
  } catch {
    return {
      message: response.ok
        ? 'The server returned an invalid response.'
        : `The backend API is unavailable (${response.status}).`,
    } as unknown as T & { message?: string }
  }
}
