import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  small?: boolean;
};

export default function FlipCard({ value, small = false }: Props) {
  const [prev, setPrev] = useState(value);
  const [current, setCurrent] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const lastRef = useRef(value);

  useEffect(() => {
    if (value !== lastRef.current) {
      setPrev(lastRef.current);
      setCurrent(value);
      setFlipping(true);
      const t = window.setTimeout(() => setFlipping(false), 1000);
      lastRef.current = value;
      return () => window.clearTimeout(t);
    }
  }, [value]);

  const sizeCls = small
    ? "w-[clamp(4.5rem,12vw,6.5rem)] h-[clamp(6rem,16vw,9rem)]"
    : "w-[clamp(6rem,16vw,10.5rem)] h-[clamp(8rem,22vw,14rem)]";

  return (
    <div className={`flip-card ${sizeCls}`}>
      <div className="flip-half top">
        <span
          className="flip-digit"
          style={small ? { fontSize: "clamp(4.5rem, 11vw, 8rem)" } : {}}
        >
          {current}
        </span>
      </div>
      <div className="flip-half bottom">
        <span
          className="flip-digit"
          style={small ? { fontSize: "clamp(4.5rem, 11vw, 8rem)" } : {}}
        >
          {current}
        </span>
      </div>

      {flipping && (
        <>
          <div className="flip-anim-top">
            <span
              className="flip-digit"
              style={small ? { fontSize: "clamp(4.5rem, 11vw, 8rem)" } : {}}
            >
              {prev}
            </span>
          </div>
          <div className="flip-anim-bottom">
            <span
              className="flip-digit"
              style={small ? { fontSize: "clamp(4.5rem, 11vw, 8rem)" } : {}}
            >
              {current}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
