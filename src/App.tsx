import './index.css'
import { useEffect, useState } from 'react'
import BulletinBoard from './components/BulletinBoard'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { initializeDatabase, selectScripStatus } from './redux/features/scripSlice'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectScripStatus);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await dispatch(initializeDatabase()).unwrap();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };
    initialize();
  }, [dispatch]);

  if (!isInitialized || status === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <div className="w-screen h-screen p-1.5 bg-black rounded-lg">
      <AppInitializer>
        <BulletinBoard />
      </AppInitializer>
    </div>
  )
}

export default App
