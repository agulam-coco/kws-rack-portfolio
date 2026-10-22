import { useEffect, useState } from "react";

// true on phone-size screens (keep in sync with the 700px breakpoints in CSS)
export const PHONE = "(max-width: 700px)";

export function useIsPhone() {
    const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);
    useEffect(() => {
        const mq = window.matchMedia(PHONE);
        const on = () => setPhone(mq.matches);
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, []);
    return phone;
}
