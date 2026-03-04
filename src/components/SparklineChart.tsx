import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface SparklineProps {
    data: number[];
    color: string;
}

export default function SparklineChart({ data, color }: SparklineProps) {
    if (!data || data.length < 2) return null;

    const width = 150;
    const height = 40;

    const min = Math.min(...data) * 0.95;
    const max = Math.max(...data) * 1.05;
    const range = max - min || 1;

    // Convert data to SVG coordinates
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height * 0.8) - (height * 0.1);
        return { x, y };
    });

    // Create curved path (simplified bezier)
    const createPath = () => {
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const current = points[i];
            const previous = points[i - 1];
            const cpX = (previous.x + current.x) / 2;
            d += ` C ${cpX},${previous.y} ${cpX},${current.y} ${current.x},${current.y}`;
        }
        return d;
    };

    const d = createPath();
    const lastPoint = points[points.length - 1];

    return (
        <View style={styles.container}>
            <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <Defs>
                    <LinearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Fill */}
                <Path
                    d={`${d} L ${width},${height} L 0,${height} Z`}
                    fill={`url(#grad-${color})`}
                />

                {/* Stroke */}
                <Path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                />

                {/* End Dot */}
                <Circle
                    cx={lastPoint.x}
                    cy={lastPoint.y}
                    r="4"
                    fill={color}
                />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%'
    }
});
