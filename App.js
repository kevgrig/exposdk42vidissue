import React from 'react';
import { Button, Dimensions, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

const MAX_DURATION = 5;
const USE_QUALITY = false;

class TakeVideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasCameraPermission: false,
      timeLeft: MAX_DURATION,
    };
  }

  async componentDidMount() {
    try {
      const { status: cameraStatus } = await Camera.requestPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      this.setState({ hasCameraPermission: cameraStatus === "granted" && audioStatus === "granted" });
    } catch (e) {
      console.log(e);
    }
  }

  onRecordingInterval = () => {
    console.log("onRecordingInterval " + this.state.timeLeft);
    this.setState((state, props) => {
      let timeLeft = state.timeLeft - 1;
      if (timeLeft < 0) {
        timeLeft = 0;
      }
      return { timeLeft: timeLeft };
    });
  }

  startRecording = async () => {
    if (!this.isRecording) {
      try {
        this.isRecording = true;

        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
  
        console.log("TakeVideoScreen.startRecording maxDuration: " + this.state.timeLeft);
  
        this.intervalId = setInterval(this.onRecordingInterval, 1000);
  
        const options = {
          maxDuration: MAX_DURATION,
        };
        
        if (USE_QUALITY) {
          options.quality = Camera.Constants.VideoQuality['720p']
        }
        
        const data = await this.cameraRef.recordAsync(options);
  
        console.log("TakeVideoScreen.startRecording returned: " + data.uri);
  
        clearInterval(this.intervalId);
  
        const fileInfo = await FileSystem.getInfoAsync(data.uri);
        if (fileInfo.exists) {
  
          const numBytes = fileInfo.size;
  
          console.log("TakeVideoScreen.startRecording bytes: " + numBytes + ", uri: " + data.uri);
  
        } else {
          console.log("File doesn't exist")
        }

        this.setState({ timeLeft: MAX_DURATION });

      } catch (e) {
        console.log("Error: " + e);
      } finally {
        this.isRecording = false;
      }
    }
  }

  render() {
    if (this.state.hasCameraPermission === null) {
      // Asking for permissions
      return <View />;
    } else if (this.state.hasCameraPermission === false) {
      return (
        <Text>No Camera</Text>
      );
    } else {
      const { width, height } = Dimensions.get("window");
      return (
        <View style={{ flex: 1, paddingTop: 40, paddingBottom: 40 }}>
          <Button title="Record" onPress={this.startRecording} />
          <Text style={{ alignSelf: "center", padding: 20 }}>Time left: {this.state.timeLeft} seconds</Text>
          <Camera
            style={{ flex: 1, width: width - 40 }}
            type={Camera.Constants.Type.front}
            ref={camera => this.cameraRef = camera}
          />
        </View>
      );
    }
  }
}

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TakeVideoScreen />
    </View>
  );
}
