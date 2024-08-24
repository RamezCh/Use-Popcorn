import { useEffect, useState } from 'react';

const tempMovieData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0133093',
    Title: 'The Matrix',
    Year: '1999',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt6751668',
    Title: 'Parasite',
    Year: '2019',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
  },
];

const tempWatchedData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: 'tt0088763',
    Title: 'Back to the Future',
    Year: '1985',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = arr =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API = 'http://www.omdbapi.com/?i=tt3896198&apikey=9f23dce6';

/*
A side effect is interaction between a React component and the world outside the component. Code that actually does something like data fetching, setting up timers, manually accessing the DOM..
*/

// Effects allow us to write code that will run at different moments, mount(1st render), re-render(state change), or unmount(deletion of component)

/*
Event Handlers vs Effects

Event Handlers: click, submit, mouseEnter..

Effects: first render, re-render, goodbye render

It keeps components synchronized with some external system like API movie data
*/

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');

  /*
  // We get A after browser paint, 1 time only
  useEffect(() => console.log('After initial render'), []);
  // We get B after A and whenever we re-render
  useEffect(() => console.log('After every render'));
  // Renders only on query state change
  useEffect(() => console.log('After Query State change'), [query]);
  // We get C first because useEffect happens after Browser Paint
  console.log('During Render');
  */

  // [] means only run on mount (1st render)
  // useEffect hook we used it to register an effect
  // Meaning when do we want to run this component?
  // When it is painted on the Screen
  // How many times?
  // Once since we used []
  // Effects can't be asynchronous
  // So we put inside a function that is asynchronous lol

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError('');
          const res = await fetch(`${API}&s=${query}`);

          if (!res.ok)
            throw new Error('Something went wrong with fetching movies');

          const data = await res.json();

          if (data.Response === 'False') throw new Error('Movie not found');

          setMovies(data.Search);
          // State is set after function called
          // Console logging movies will show empty array
        } catch (err) {
          console.log(err.message);
          setError(err.message);
          // finally means it is always executed
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError('');
        return;
      }
      // we have to type slowly due to something called the race condition
      fetchMovies();
    },
    [query]
  );
  // If we set state here, it will cause an infinite loop and take a lot of resources
  // We can't have side effects here
  // We can't set state here
  /* isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage />
          ) : (
            <MovieList movies={movies} />
          )*/

  function handleSelectMovie(id) {
    setSelectedId(selectedId => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

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
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          )}
        </Box>
        {/*
        Similar to children but passing it as a prop
        <Box2 element={<MovieList movies={movies} />} />
        */}
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
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
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

/*
Explicitly defined prop
Works as children but you pass component as prop instead of between opening n closing tag

function Box2({ element }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen(open => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && element}
    </div>
  );
}
*/

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

function MovieDetails({ selectedId, onCloseMovie }) {
  return (
    <div className="details">
      <button className="btn-back" onClick={onCloseMovie}>
        &larr;
      </button>
      {selectedId}
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
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
function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map(movie => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
// Stateless/Presentational Component
function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
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
      </div>
    </li>
  );
}

/*
Components will be either:
Stateless/presentational
-> Receive props and present received data
-> Usually small components like logo or results
-> Highly reusable

Stateful
-> Have state
-> Reusable

Structural
-> Pages
-> Layouts
-> Screens
-> Result of composition
-> Large and non-reusable, but don't have to
*/

/*
Prop drilling is when you pass a state or value into a lot of components to reach a certain component that is deeply nested
*/

/*
What is Component Composition?
It is when we use components inside other components.

Like App Component.

But it can affect re-usability.

This is where children comes in and lets us be more dynamic and reuse more components.

We can pass components as the children prop and hence making more components re-usable

This is component composition: combining different components using the children prop (or explicitly defined props)

It also fixes prop drilling

This is possible because components do not need to know what is going to be passed in advance
*/

/*
Props as an API

Components always created by someone and consumed by someone

On a Team creator and consumer won't be the same person, so we need to think in their prespective

Creator builds component and defines what props to be accepted

Consumer uses it and gives values to the props

Think of Component Props as a Public API

We are defining the public interface of our component and choosing how much complexity of the component we want to expose to the consumer of the API

In the end a component is basically just an abstraction
*/

/*
What is the useEffect Dependency Array?

By default, effects run after every render. We can prevent that by passing a dependency array.

Without the dependency array, React doesn't know when to run the effect

Each time one of the dependencies changes, the effect will be executed again

Every state variable and prop used inside the effect MUST be included in the dependency array


useEffect is a synchronization mechanism

it is like an event listener that is listening for one dependency to change. Whenever a dependency changes, it will execute the effect again.

Effects react to updates to state and props used inside the effect (the dependencies). So effects are "reactive" like state updates re-rendering the UI

Note: this ONLY works when you specific the dependency array

Dependency change -> Effect is executed again, component is re-rendered

useEffect(fn, [x,y,z]); -> synch with x,y,z and mount+re-render by updating x, y or z

useEffect(fn, []); -> synch with no state or props, only runs on mount(1st render)

useEffect(fn); -> effect will run on every render (bad idea/infinite loop) | synch with everything


When are effects executed?

Mount(Initial Render) -> Commit -> Browser Paint -> EFFECT -> title Changes -> Re-render -> Commit -> Layout Effect -> Browser Paint -> Effect -> ? -> Unmount(Disappear from screen) -> ?

Downside effect: if it sets state, an additional render will be required
*/
