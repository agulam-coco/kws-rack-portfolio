export default function AmpHead({ color }: { color: string }) {
    return (
        <div className="amp" style={{ "--accent": color } as React.CSSProperties}>
            <div className="grille-cloth" />
            <div className="knobs">
                {[0, 1, 2, 3, 4].map((i) => <span key={i} className="knob" />)}
                <i className="jewel" />
            </div>
            <span className="unit-label">GUITARS</span>
        </div>
    );
}