import {useState} from 'react';
import {Plugins} from '@capacitor/core';

const {Network} = Plugins;

const initialState = {
    connected: false,
    connectionType: 'unknown',
}

export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState<boolean>(true);
  Network.getStatus().then(status => setNetworkStatus(status.connected));
  Network.addListener('networkStatusChange', (status) => {
    setNetworkStatus(status.connected);
  })

  return {networkStatus};
};

// export const useNetwork = () => {
//     const [networkStatus, setNetworkStatus] = useState(initialState)
//     useEffect(() => {
//         const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
//         Network.getStatus().then(handleNetworkStatusChange);
//         let canceled = false;
//         return () => {
//             canceled = true;
//             handler.remove();
//         }
//
//         function handleNetworkStatusChange(status: NetworkStatus) {
//             console.log('useNetwork - status change', status);
//             if (!canceled) {
//                 setNetworkStatus(status);
//             }
//         }
//     }, [])
//     return {networkStatus};
// };
