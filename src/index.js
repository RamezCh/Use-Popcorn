import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
import StarRating from './StarRating';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {
      // <App />
    }
    <StarRating maxRating={10} />
    <StarRating
      maxRating={5}
      size={36}
      className={'test'}
      messages={['Terrible', 'Bad', 'Okay', 'Good', 'Amazing']}
      defaultRating={3}
    />
    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <StarRating size={24} color="red" className="test" defaultRating={2} />

    <Test /> */}
  </React.StrictMode>
);
