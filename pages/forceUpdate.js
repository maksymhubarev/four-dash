import { useState } from "react";

export const useForceUpdate = () => {
  const [, setForceUpdate] = useState(false);

  const forceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  return forceUpdate;
};

//exprt
export default useForceUpdate;
