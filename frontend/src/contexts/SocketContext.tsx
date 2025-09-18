import { createContext, useEffect, useState } from 'react';
import { VOICE_ENABLED, WS_URL } from '../config/env';

export const SocketContext = createContext<WebSocket | null>(null);

export function SocketProvider({ children }:{children:any}){
  const [socket,setSocket] = useState<WebSocket|null>(null);
  
  useEffect(()=>{
    if(!VOICE_ENABLED) return;
    
    try{
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.debug('[voice] WebSocket connected');
        setSocket(ws);
      };
      
      ws.onclose = () => {
        console.debug('[voice] WebSocket disconnected');
        setSocket(null);
      };
      
      ws.onerror = (error) => {
        console.warn('[voice] WebSocket error:', error);
        setSocket(null);
      };
      
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }catch(error){ 
      console.warn('[voice] disabled:', error); 
    }
  },[]);
  
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}