import { jest } from '@jest/globals'

const apiRequestMock = jest.fn()
const fetchCsrfTokenMock = jest.fn()
const getStateMock = jest.fn()
const setStateMock = jest.fn()

await jest.unstable_mockModule('../apiClient.js', () => ({
  apiRequest: apiRequestMock,
}))

await jest.unstable_mockModule('../csrfService.js', () => ({
  fetchCsrfToken: fetchCsrfTokenMock,
  setStoredCsrfToken: jest.fn(),
}))

await jest.unstable_mockModule('../../app/store.js', () => ({
  getState: getStateMock,
  setState: setStateMock,
}))

const { login, isAuthenticated } = await import('../authService.js')

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetchCsrfTokenMock.mockResolvedValue('csrf-test')
  })

  describe('isAuthenticated', () => {
    it('retourne true quand le store indique une session active', () => {
      getStateMock.mockReturnValue({ auth: { isAuthenticated: true } })
      expect(isAuthenticated()).toBe(true)
    })

    it('retourne false sans session', () => {
      getStateMock.mockReturnValue({ auth: { isAuthenticated: false } })
      expect(isAuthenticated()).toBe(false)
    })
  })

  describe('login', () => {
    it("appelle l'API login puis récupère le token CSRF", async () => {
      const user = { id: 'u1', email: 'test@example.com' }
      apiRequestMock.mockResolvedValue(user)

      const result = await login({ email: 'test@example.com', password: 'password1' })

      expect(apiRequestMock).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password1' }),
      })
      expect(fetchCsrfTokenMock).toHaveBeenCalled()
      expect(setStateMock).toHaveBeenCalled()
      expect(result).toEqual(user)
    })
  })
})
