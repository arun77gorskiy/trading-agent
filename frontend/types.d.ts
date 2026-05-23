/**
 * Stub type declarations for external modules not available during type checking.
 * These allow TypeScript to compile when npm packages and their @types are unavailable.
 */

declare module 'react' {
  export function useState<T = any>(initialState?: T | (() => T)): [T | undefined, (value: T | undefined) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T;
  export function useRef<T = any>(initialValue?: T): { current: T };
  export type FC<P = any> = (props: P) => JSX.Element;
  const React: any;
  export default React;
}

declare module 'react-native';

declare module 'expo-router' {
  export function useLocalSearchParams<T = any>(): T;
  export function useRouter(): any;
  export const Stack: any;
  export const Tabs: any;
  export const Link: any;
  const router: any;
  export default router;
}

declare module '@expo/vector-icons' {
  export const Ionicons: any;
  const icons: any;
  export default icons;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
  const status: any;
  export default status;
}

declare module 'expo-location' {
  export const requestForegroundPermissionsAsync: any;
  export const getCurrentPositionAsync: any;
  export const Accuracy: any;
}

declare module 'react-native-maps' {
  export type Region = any;
  export const MapView: any;
  export const Marker: any;
  const maps: any;
  export default maps;
}

declare module '@supabase/supabase-js';
