import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";
const LOCATION_KEY = "@location";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [toDos, setToDos] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentThing, setCurrentThing] = useState("");
  const [edit, setEdit] = useState("");
  const [modalKey, setModalKey] = useState("");

  useEffect(async () => {
    const currentLocation = await AsyncStorage.getItem(LOCATION_KEY);
    if (currentLocation === "false") {
      setWorking(false);
    }
    loadToDos();
  }, []);
  useEffect(async () => {
    const newWorking = working.toString();
    await AsyncStorage.setItem(LOCATION_KEY, newWorking);
  }, [working]);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChange = (payload) => setText(payload);

  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (error) {
      console.log(error);
    }
  };

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = { ...toDos, [Date.now()]: { text, working, done } };
    setToDos(newToDos);
    await saveTodos(newToDos);
    setText("");
  };
  const deleteToDo = (key, schedule) => {
    Alert.alert(schedule, "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveTodos(newToDos);
        },
      },
    ]);
    return;
  };

  const handleDone = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    await saveTodos(newToDos);
  };

  const handleModal = (key) => {
    const newToDos = { ...toDos };
    const { text } = newToDos[key];
    setCurrentThing(text);
    setModalKey(key);
    setModalVisible(true);
  };

  const onChangeEdit = (payload) => setEdit(payload);
  const handleEditSubmit = async (key) => {
    if (edit === "") {
      return;
    }
    const newToDos = { ...toDos };
    newToDos[key].text = edit;
    setToDos(newToDos);
    await saveTodos(newToDos);
    setEdit("");
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* App Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      {/* Text Input */}
      <View>
        <TextInput
          placeholder={working ? "Add a To Do" : "Where do you wanna go?"}
          returnKeyType="send"
          onChangeText={onChange}
          value={text}
          onSubmitEditing={addTodo}
          style={styles.input}
        />
      </View>

      {/* Work and Travel List */}
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {/* Modal */}
              <Modal
                key={modalKey}
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <Text>Your Current Schedule is..</Text>
                    <Text>" {currentThing} "</Text>
                    <TextInput
                      key={modalKey}
                      placeholder="What's on your mind?"
                      returnKeyType="done"
                      onChangeText={onChangeEdit}
                      value={edit}
                      style={styles.editInput}
                      onSubmitEditing={handleEditSubmit}
                    />
                    <TouchableOpacity
                      onPress={() => handleEditSubmit(modalKey)}
                    >
                      <Text>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Works and Travel List */}
              <View style={styles.toDoBox}>
                <TouchableOpacity key={key} onPress={() => handleDone(key)}>
                  <Text style={{ marginRight: 14 }}>
                    <Fontisto
                      name="check"
                      size={18}
                      color={toDos[key].done ? "#DC143C" : "#aaa"}
                    />
                  </Text>
                </TouchableOpacity>
                <Text
                  style={toDos[key].done ? styles.toDoDone : styles.toDoText}
                >
                  {toDos[key].text}
                </Text>
              </View>

              <View style={styles.toDoIconBox}>
                <TouchableOpacity
                  onPress={() => deleteToDo(key, toDos[key].text)}
                >
                  <Text>
                    <Fontisto name="trash" size={18} color="#aaa" />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ display: toDos[key].done ? "none" : "flex" }}
                >
                  <Text>
                    <Fontisto
                      name="commenting"
                      size={18}
                      color={toDos[key].done ? "#696969" : "#aaa"}
                      onPress={() => handleModal(key)}
                    />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginVertical: 12,
    fontSize: 16,
  },
  toDo: {
    backgroundColor: theme.gray,
    marginBottom: 10,
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoDone: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  toDoBox: {
    flex: 0.8,
    flexDirection: "row",
  },
  toDoIconBox: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  done: {
    color: "red",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalContainer: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    backgroundColor: "#dcdcdc",
    borderRadius: 20,
    padding: 35,
  },
  editInput: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginVertical: 8,
    borderRadius: 30,
  },
});
