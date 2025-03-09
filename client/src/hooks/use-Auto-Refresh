
import { useEffect } from 'react';

/**
 * Custom hook to automatically refresh data at specified intervals
 * @param callback Function to execute at each interval
 * @param interval Interval time in milliseconds (default: 5000 ms)
 * @param dependencies Array of dependencies to control when the effect should re-run
 */
export function useAutoRefresh(
  callback: () => void,
  interval = 5000,
  dependencies: any[] = []
) {
  useEffect(() => {
    // Execute the callback immediately when the component mounts
    callback();
    
    // Set up the interval
    const intervalId = setInterval(() => {
      callback();
    }, interval);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, dependencies);
}
