import React from 'react';
import type { Updater } from 'use-immer';
import { State } from './typing';
interface ContextType extends State {
  updateContext: Updater<State>;
  updateData: (data: any) => any;
  GISDK_ID: string;
  /** 用户自己的数据 */
  [userVars: string]: any;
}

//@ts-ignore
const defaultContext = {
  graph: null,
  apis: null,
  theme: null,
  layout: null,
  updateContext: () => {},
  updateData: () => {},
} as ContextType;

export const GraphInsightContext = React.createContext(defaultContext);

export const useContext = () => {
  const context = React.useContext(GraphInsightContext);
  if (context === undefined || Object.keys(context).length === 0) {
    throw new Error(`useContext must be used within a GraphInsightProvider`);
  }

  return context;
};