import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import Timer from "../components/UI/Timer";
import { Picker } from "@react-native-picker/picker";
import { Entypo } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import colors from "../constants/colors";

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
          <Entypo name="time-slot" size={wp("8%")} color="white" />
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
    marginHorizontal: wp("1%"),
    justifyContent: "center",
  },
  timerControl: {
    width: wp("95%"),
    padding: wp("2.5%"),
    marginVertical: hp("1.25%"),
    backgroundColor: colors.lightGray,
    borderRadius: wp("2.5%"),
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.lightGray,
  },
  individualPickerContainer: {
    flex: 1,
    alignItems: "center",
  },
  picker: {
    width: wp("40%"),
  },
  pickerItem: {
    fontSize: wp("3%"),
    height: hp("15%"),
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginBottom: hp("1%"),
  },
  circleButton: {
    backgroundColor: colors.secondaryGreen,
    borderRadius: wp("20%"),
    width: wp("16%"),
    height: wp("16%"),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: wp("2.5%"),
  },
  cancelButton: {
    backgroundColor: colors.light,
  },
  buttonText: {
    color: "white",
    fontSize: wp("3%"),
    fontWeight: "bold",
  },
  addTimerContainer: {
    marginLeft: wp("2.5%"),
    paddingBottom: hp("1.25%"),
  },
  addTimerBtn: {
    backgroundColor: "black",
    paddingHorizontal: wp("2.5%"),
    paddingVertical: hp("0.875%"),
    borderRadius: wp("5%"),
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    width: wp("35%"),
    marginBottom: hp("1.25%"),
  },
  addTimerBtnText: {
    color: "white",
    fontSize: wp("3.5%"),
    paddingRight: wp("2%"),
    fontWeight: "bold",
  },
});
