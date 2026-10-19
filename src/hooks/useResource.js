import { useState, useEffect } from 'react'

/**
 * Shared data-fetching hook.
 *
 * Every page in this app needs the same three things: request data on mount,
 * hold a loading flag for skeletons, and re-run the request when a filter
 * changes. Writing that loop five times meant five copies of the same bug
 * surface (a stuck spinner when a request fails, no cleanup on unmount).
 *
 * @param {Function} fetcher - async function returning the data to store.
 * @param {Array}    deps    - re-run the request when any of these change.
 * @returns {{ data, loading, error, reload }} reload() forces a fresh fetch.
 */
export function useResource(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Guards against a slow response landing after the component unmounts,
    // which would call setState on a dead component.
    let active = true

    const run = async () => {
      // The flags are set inside the async body rather than before the await,
      // so this render pass does not schedule a second one synchronously.
      setLoading(true)
      setError('')

      try {
        const result = await fetcher()
        if (active) setData(result)
      } catch (err) {
        if (active) {
          console.error(err)
          setError(err.message || 'Something went wrong.')
        }
      } finally {
        // A skipped response must still clear the spinner, or the page stays
        // in its loading state forever.
        if (active) setLoading(false)
      }
    }

    run()

    return () => { active = false }
    // deps are supplied by the caller because they vary per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // Stable re-fetch for use after a mutation, without remounting the page.
  const reload = async () => {
    setLoading(true)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, reload, setData }
}

export default useResource
