import PropTypes from "prop-types";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(ref: any, onClick: () => void) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClick();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClick, ref]);
}

/**
 * Component that alerts if you click outside of it
 */
function OutsideAlerter({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, onClick);

  return <div ref={wrapperRef}>{children}</div>;
}

OutsideAlerter.propTypes = {
  children: PropTypes.element.isRequired,
};

export default OutsideAlerter;
