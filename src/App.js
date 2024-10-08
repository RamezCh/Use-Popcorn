import { useEffect, useRef, useState } from 'react';
import StarRating from './StarRating';
import { useMovies } from './useMovies';
import { useLocalStorageState } from './useLocalStorageState';
import { useKey } from './useKey';

const average = arr =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API = 'http://www.omdbapi.com/?apikey=9f23dce6';

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  // do not call a fn in useState, instead use Callbacks ( a fn that can be called later)
  const [query, setQuery] = useState('');
  /*
  //const [watched, setWatched] = useState([]);
  // useState takes call back fn as well
  // only executed once on the initial render
  const [watched, setWatched] = useState(function () {
    // pure fn only, no arguments
    const storedValue = localStorage.getItem('watched'); // watched is key
    // it uses return value as a state
    // we stored data as string
    // we need array
    // JSON converts string to object
    return JSON.parse(storedValue);
  });
*/
  // Creating Custom Hook for Local Storage
  const [watched, setWatched] = useLocalStorageState([], 'watched');
  // Using our own Custom hook
  const { movies, isLoading, error } = useMovies(query, handleCloseMovie);

  function handleSelectMovie(id) {
    setSelectedId(selectedId => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);
    // Stale state, old version of watched, not updated yet
    // localStorage.setItem('watched', watched)

    // Using this way, we get old array and add on top of it new value movie
    // LocalStorage only takes strings
    // So we do Json.stringify
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id));
  }

  //Order: State -> event handler -> effects

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        {movies && <NumResults movies={movies} />}
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⚠</span>
      {message}
    </p>
  );
}

// Structural Component
function NavBar({ children }) {
  // Component composition using children prop
  // Logo stateless so we kept it in NavBar
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
// Stateless/Presentational Component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
// Stateless/Presentational Component
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
// Stateful Component
function Search({ query, setQuery }) {
  /*
    // how NOT to select DOM elements in React
  useEffect(function () {
    // React is Declarative
    // This isn't declarative
    const el = document.querySelector('.search');
    console.log(el);
    el.focus();
  }, []);
  */

  // How to select DOM elements in React
  const inputEl = useRef(null); // Initial value

  /*
  useEffect(
    function () {
      // Create callback fn so we can clean up later
      function callback(e) {
        if (document.activeElement === inputEl.current) {
          return;
        }
        // Current is box where we store value
        if (e.code === 'Enter') {
          inputEl.current.focus();
          setQuery('');
        }
        // inputEl.current is where we used ref={}
        // so input DOM element
      }
      // Add event listener
      document.addEventListener('keydown', callback);
      // Clean Up
      return () => document.removeEventListener('keydown', callback);
    },
    [setQuery]
  );
*/

  useKey('Enter', function () {
    if (document.activeElement === inputEl.current) {
      return;
    }
    inputEl.current.focus();
    setQuery('');
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
// Structural Component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// Stateful Component
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen(open => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}

// Stateful Component
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map(movie => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

// Stateless/Presentational Component
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  // What we pass to useState is initial state
  // React only looks at it at initial render
  const [movie, setMovie] = useState({});

  // Updating state is asynchronous
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const countRef = useRef(0);
  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);

  const isWatched = watched.map(mov => mov.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    mov => mov.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // derived state
  // gets created on each re-render
  const isTop = imdbRating > 8;
  console.log(isTop);

  useKey('Escape', onCloseMovie);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(`${API}&i=${selectedId}`);

        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  // Each effect has only one purpose
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      // Cleanup function
      // Executes when component unmounts
      return function () {
        document.title = 'usePopcorn';
      };
    },

    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie with {watchedUserRating} <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

// Stateless/Presentational Component
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map(movie => movie.imdbRating));
  const avgUserRating = average(watched.map(movie => movie.userRating));
  const avgRuntime = average(watched.map(movie => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
// Stateless/Presentational Component
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map(movie => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
// Stateless/Presentational Component
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

/*
useState Summary:
- Create State
-> Directly a value OR callback fn (lazy evaluation)
Directly: const[count, setCount] = useState(23);

Lazy evaluation:
const [count, setCount] = useState(()=>localStorage.getItem('count'));

Note: Fn must be pure & no arguments. Called only on initial render

- Update State
> Simple way: setCount(1000);
> Based on current state:
  setCount((c)=>c+1) [preferred way]

  Note: Fn must be pure and return next state
  Make sure to NOT mutate objects or arrays but to replace them
*/

/*
What are Refs?

Ref = reference

"Box"(object) with a mutable .current property that is persisted across renders("normal" variables are always reset)

Two big use cases:
> Create variables that stay the same between renders(prev State, setTimeout ID..)

>Select and store DOM elements

Refs are for data that is NOT rendered: usually only appear in event handlers or effects, not in JSX (otherwise use state)

Do NOT read write or read .current in render logic (like state)

Updating Refs does not cause re-render

useState for re-render component, immutable, async

useRef for remembering state, not re-rendering, mutable, sync
*/

/*
What are custom Hooks?
When to Create one?

It is all about reusability

I wanna reuse UI or I wanna reuse Logic

UI -> Component

Logic -> Does it contain any Hooks? 
No -> Regular Fn
Yes -> Custom Hook

Custom Hooks allow us to re-use non-visual logic

One custom hook should have one purpose, to make it re-usable and portable (even across multiple projects)

Rules of hooks apply to custom hooks as well
*/
