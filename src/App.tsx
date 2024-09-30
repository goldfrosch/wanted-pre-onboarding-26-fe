import { useState, useRef, useMemo, useEffect } from "react";
import { getMockData, type MockData } from "./mockApi";

function App() {
  const [list, setList] = useState<MockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  const page = useRef(0);

  const loadingRef = useRef<HTMLDivElement | null>(null);

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (isEnd || isLoading) {
          return;
        }
        setIsLoading(true);
        getMockData(page.current)
          .then((res) => {
            setList((prev) => [...prev, ...res.datas]);
            page.current += 1;
            setIsEnd(res.isEnd);

            if (res.isEnd) {
              observer.disconnect();
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    },
    {
      threshold: 0.5,
    }
  );

  const totalPrice = useMemo(() => {
    return list.reduce((acc, cur) => acc + cur.price, 0);
  }, [list]);

  useEffect(() => {
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div>Total Price: {totalPrice.toLocaleString()}원</div>
      {list.map((item) => (
        <div key={item.productId}>
          <p>{item.productName}</p>
          <p>{item.price}</p>
        </div>
      ))}
      {!isLoading && !isEnd && (
        <div
          ref={(ref) => {
            if (ref === null) return;
            loadingRef.current = ref;
            observer.observe(loadingRef.current);
          }}
        />
      )}
    </>
  );
}

export default App;
