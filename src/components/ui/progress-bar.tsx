import * as React from "react";
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: '100%' }}>
      <Box sx={{ width: "100%", mr: 1, position: 'relative' }}>
        {/* Background glow effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.3) 100%)',
            filter: 'blur(4px)',
            opacity: 0.6,
            zIndex: 1,
          }}
        />
        
        {/* Progress bar with glowing color */}
        <LinearProgress
          variant="determinate"
          value={Math.min(Math.max(props.value, 0), 100)}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(226, 232, 240, 0.5)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 5,
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden',
          }}
        />
      </Box>
      <Box sx={{ minWidth: 36 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#3b82f6',
            fontWeight: 600,
            textShadow: '0 0 8px rgba(59, 130, 246, 0.2)'
          }}
        >
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}