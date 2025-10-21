export function AppChip({app}: {app: any}) {
    return (
        <div className="appchip" onClick={() => {
            window.open(app.mainUrl, "_blank")
        }}>
            <img src={app.logo} style={{width: "20px", height: "20px"}} />
            <div>{app.name}</div>
        </div>
    );
}