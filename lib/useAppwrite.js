import { useEffect, useState } from "react";
import { toast } from "./toast";

const useAppwrite = (fn) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await fn();
      setData(response);
    } catch (error) {
      toast("Error" + error);
      console.error("Error", error);
    } finally {
      setIsLoading(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();
  console.log(data);
  return { data, isLoading, refetch };
};

export default useAppwrite;
