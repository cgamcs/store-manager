import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(1);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4">
          <Minus
            onClick={decrement}
            strokeWidth={3}
            className="w-6 h-6 py-1 rounded-sm bg-claro-primario hover:bg-claro-primario/50 active:scale-95 transition-all duration-150 flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:shadow-xl"
          />
          
          <span>{count}</span>
          
          <Plus
            onClick={increment}
            strokeWidth={3}
            className="w-6 h-6 py-1 rounded-sm bg-claro-primario hover:bg-claro-primario/50 active:scale-95 transition-all duration-150 flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:shadow-xl"
          />
        </div>
    </>
  );
}