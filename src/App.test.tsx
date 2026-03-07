import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/SchoolCodeForm', () => function MockSchoolCodeForm() {
  return <div>Mock School Code Form</div>;
});

test('renders school code input', () => {
  render(<App />);
  const formElement = screen.getByText(/mock school code form/i);
  expect(formElement).toBeInTheDocument();
});
