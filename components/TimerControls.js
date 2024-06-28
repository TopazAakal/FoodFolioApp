import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import Timer from "../components/UI/Timer";
import { Picker } from "@react-native-picker/picker";
import { Entypo } from "@expo/vector-icons";

const TimerControls = () => {
  const [timers, setTimers] = useState([]);

  const addTimer = () => {
    const newTimer = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isRunning: false,
      showPicker: true,
    };
    setTimers([...timers, newTimer]);
  };

  const startTimer = (index) => {
    const newTimers = [...timers];
    const totalSeconds =
      newTimers[index].hours * 3600 +
      newTimers[index].minutes * 60 +
      newTimers[index].seconds;
    newTimers[index].totalSeconds = totalSeconds;
    newTimers[index].isRunning = true;
    newTimers[index].showPicker = false;
    setTimers(newTimers);
  };

  const cancelTimer = (index) => {
    setTimers(timers.filter((_, idx) => idx !== index));
  };

  const updateTimerSetting = (index, setting, value) => {
    const newTimers = [...timers];
    newTimers[index][setting] = parseInt(value);
    setTimers(newTimers);
  };

  const handleTimerComplete = () => {
    Alert.alert("נגמר הזמן!", "הטיימר סיים את הספירה");
  };

  return (
    <View>
      <View style={styles.addTimerContainer}>
        <TouchableOpacity style={styles.addTimerBtn} onPress={addTimer}>
          <Entypo name="time-slot" size={30} color="white" />
          <Text style={styles.addTimerBtnText}>הוסף טיימר </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.timersContainer}>
        {timers.map((timer, index) => (
          <View key={index} style={styles.timerControl}>
            {timer.showPicker && (
              <View style={styles.pickerContainer}>
                <View style={styles.individualPickerContainer}>
                  <Picker
                    selectedValue={timer.hours}
                    onValueChange={(itemValue) =>
                      updateTimerSetting(index, "hours", itemValue)
                    }
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item label={`${i} שעות`} value={i} key={i} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.individualPickerContainer}>
                  <Picker
                    selectedValue={timer.minutes}
                    onValueChange={(itemValue) =>
                      updateTimerSetting(index, "minutes", itemValue)
                    }
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item label={`${i} דק'`} value={i} key={i} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.individualPickerContainer}>
                  <Picker
                    selectedValue={timer.seconds}
                    onValueChange={(itemValue) =>
                      updateTimerSetting(index, "seconds", itemValue)
                    }
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item label={`${i} שנ'`} value={i} key={i} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
            {timer.totalSeconds > 0 && (
              <Timer
                initialTime={timer.totalSeconds}
                onComplete={handleTimerComplete}
              />
            )}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => startTimer(index)}
                style={styles.circleButton}
              >
                <Text style={styles.buttonText}>התחלה</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => cancelTimer(index)}
                style={[styles.circleButton, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TimerControls;

const styles = StyleSheet.create({
  timersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 4,
  },
  timerControl: {
    width: "49%",
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  individualPickerContainer: {
    flex: 1,
    alignItems: "center",
  },
  picker: {
    marginHorizontal: 0,
    paddingHorizontal: 0,
    width: 95,
  },
  pickerItem: {
    fontSize: 12,
    height: 120,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
    marginBottom: 20,
  },
  circleButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  addTimerContainer: {
    marginLeft: 10,
    paddingBottom: 5,
  },
  addTimerBtn: {
    backgroundColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    width: "35%",
    marginBottom: 10,
  },
  addTimerBtnText: {
    color: "white",
    fontSize: 16,
    paddingRight: 8,
    fontWeight: "bold",
  },
});
