import React from 'react';

interface YouTubeEmbedProps {
    videoId: string;
    title?: string;
    width?: number;
    height?: number;
    className?: string;
}

const YoutubeEmbed: React.FC<YouTubeEmbedProps> = ({
    videoId,
    title = 'YouTube video player',
    width = 560,
    height = 315,
    className = '',
}) => {
    return (
        <div className={`relative overflow-hidden ${className}`} style={{ paddingBottom: '56.25%' }}>
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                width={width}
                height={height}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default YoutubeEmbed;