// ALL YOUR CODE SHOULD BE HERE
// DO NOT EDIT THE OTHER FILES

import net from "node:net";

const targetHost = 'localhost';
const targetPort = 3032;

const server = net.createServer((clientSocket) => {
  const targetSocket = net.createConnection({ host: targetHost, port: targetPort }, () => {

    let buffer = ""

    let count = 0

    targetSocket.on("data", (data) => {

      // this part of the code is to exclude the input taking prompt from being processed as usual data (the prompt has total 55 characters)
      count += data.length
      if (count <= 55) {
        clientSocket.write(data)
        return
      }

      let newData = data.toString()
      buffer += newData.slice(0, -1)
      
      // tracker for new line characters
      let newLineTracker = []
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] == "\n") {
          newLineTracker.push(i)
        }
      }

      buffer = buffer.split("\n").join("")

      // tracker for spaces
      let spaceTracker = []
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] == " ") {
          spaceTracker.push(i)
        }
      }

      // here I am splitting the text between spaces and then merging all the substrings.
      // after that I am replacing the target sequence 
      let splitTextArray = buffer.split(" ")
      let mergedText = splitTextArray.join("")
      let updatedBuffer = mergedText.replaceAll("ilikebigtrainsandicantlie", "-------------------------")

      // here I am putting the spaces back in their places
      for (let i = 0; i < spaceTracker.length; i++) {
        updatedBuffer = updatedBuffer.slice(0, spaceTracker[i]) + " " + updatedBuffer.slice(spaceTracker[i], updatedBuffer.length)
      }

      // here I am putting the new line characters in their places
      for (let i = 0; i < newLineTracker.length; i++) {
        updatedBuffer = updatedBuffer.slice(0, newLineTracker[i]) + "\n" + updatedBuffer.slice(newLineTracker[i], updatedBuffer.length)
      }
      // as I have added the new data stream after slicing the last character, to exclude the new line character, here,
      // I am again putting the new that new line character back in its place 
      updatedBuffer += "\n"

      // this variable indicates the index from where the next processing will begin.
      let remainingStart = updatedBuffer.lastIndexOf("-") + 1

      clientSocket.write(updatedBuffer.slice(0, remainingStart))
      buffer = updatedBuffer.slice(remainingStart, updatedBuffer.length)
    });

    clientSocket.on("data", (data) => {
      targetSocket.write(data);
    });
  });


  targetSocket.on('error', (err) => {
    console.error('Error connecting to target:', err);
    clientSocket.end();
  });


  clientSocket.on('error', (err) => {
    console.error('Client socket error:', err);
    targetSocket.end();
  });
});

const proxyPort = 3031;
server.listen(proxyPort, () => {
  console.log(`Proxy server is listening on port ${proxyPort}`);
});
