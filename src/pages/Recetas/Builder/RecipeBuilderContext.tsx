import React, { createContext, useContext, type ReactNode } from 'react';
import { useRecipeBuilder } from './useRecipeBuilder';

// Obtenemos el tipo de retorno del hook para usarlo en el contexto
type UseRecipeBuilderReturn = ReturnType<typeof useRecipeBuilder>;

const RecipeBuilderContext = createContext<UseRecipeBuilderReturn | null>(null);

interface RecipeBuilderProviderProps {
  children: ReactNode;
  value: UseRecipeBuilderReturn;
}

export const RecipeBuilderProvider: React.FC<RecipeBuilderProviderProps> = ({ children, value }) => {
  return (
    <RecipeBuilderContext.Provider value={value}>
      {children}
    </RecipeBuilderContext.Provider>
  );
};

export const useRecipeBuilderContext = () => {
  const context = useContext(RecipeBuilderContext);
  if (!context) {
    throw new Error('useRecipeBuilderContext must be used within a RecipeBuilderProvider');
  }
  return context;
};
