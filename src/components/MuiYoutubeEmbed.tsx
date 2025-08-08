import React from 'react';
import { Card, CardContent, Box } from '@mui/material';

interface YouTubeEmbedProps {
    videoId: string;
    title?: string;
    width?: number;
    height?: number;
}

const MuiYoutubeEmbed: React.FC<YouTubeEmbedProps> = ({
    videoId,
    title = 'YouTube video player',
    width = 560,
    height = 315,
}) => {
    return (
        <Card sx={{ maxWidth: 640 }}>
            <CardContent>
                <Box 
                    sx={{ 
                        position: 'relative', 
                        overflow: 'hidden',
                        paddingBottom: '56.25%', // 16:9 aspect ratio
                        height: 0,
                        borderRadius: 1,
                    }}
                >
                    <Box
                        component="iframe"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={title}
                        width={width}
                        height={height}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: 1,
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

export default MuiYoutubeEmbed;