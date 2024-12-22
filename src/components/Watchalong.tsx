const Watchalong = () => {
    return (
        <div className="text-center text-lg text-fontRed">
            <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    //src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=ZTNYaWslQH8VCtsA"
                    src="https://webrtctzn.glitch.me/?room=footy"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};
export default Watchalong;
