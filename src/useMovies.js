import { useEffect, useState } from 'react';

const API = 'http://www.omdbapi.com/?apikey=9f23dce6';
// Using name exports for Custom Hooks
// Using default for Components
export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError('');
          const res = await fetch(`${API}&s=${query}`, {
            signal: controller.signal,
          });

          if (!res.ok)
            throw new Error('Something went wrong with fetching movies');

          const data = await res.json();

          if (data.Response === 'False') throw new Error('Movie not found');

          setMovies(data.Search);

          setError('');
        } catch (err) {
          console.error(err.message);
          if (err.name !== 'AbortError') {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError('');
        return;
      }
      // Uses Call back only if it exists
      callback?.();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}
