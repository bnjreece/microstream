import { useState } from 'react';
import axios from 'axios';
import styled, { ThemeProvider } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0 0.5rem;
  background-color: #282c34;
`;

const TextArea = styled.textarea`
  width: 80%;
  height: 200px;
  margin: 15px 0;
  padding: 10px;
`;

const Button = styled.button`
  padding: 10px 24px;
  background-color: #61dafb;
  border: none;
  border-radius: 5px;
  color: #282c34;
  font-size: 1rem;
  cursor: pointer;

  :hover {
    background-color: #52c8fa;
  }
`;

export default function Home() {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('/api/postToAll', { text });
      alert('Posted successfully!');
      setText('');
    } catch (err) {
      console.error('Error posting text:', err);
    }
  };

  return (
    <ThemeProvider theme={{}}>
      <Container>
        <h1>Post to all platforms</h1>
        <form onSubmit={handleSubmit}>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write something..."
          />
          <Button type="submit">Post</Button>
        </form>
      </Container>
    </ThemeProvider>
  );
}
