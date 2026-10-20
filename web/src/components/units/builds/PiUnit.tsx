export default function PiUnit({ color }: { color: string }) {
    return (
        <div className="pi" style={{ "--accent": color } as React.CSSProperties}>
            <span className="rj45" data-jack="builds" />
            <div className="pcb"><span className="fan" /><i className="led" /></div>
            <span className="unit-label">SERVER RACK</span>
        </div>
    );
}