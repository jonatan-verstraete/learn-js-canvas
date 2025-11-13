import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

import { InstancedMesh, BufferGeometry } from "three";
import { Box } from "@react-three/drei";

const Main = () => {
  const meshRef = useRef<InstancedMesh<BufferGeometry> | any>();

  const masterGainRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [allAudios, setAllAudios] = useState<HTMLAudioElement[]>([]);

  useEffect(() => {
    const ev = ({ key }: KeyboardEvent) => {
      if (key === " ") {
        const play = allAudios[0]?.paused;
        allAudios.forEach((audio) => (play ? audio.play() : audio.pause()));
      }
    };
    document.addEventListener("keydown", ev);
    return () => document.removeEventListener("keydown", ev);
  }, [allAudios]);

  const addAudio = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    window.voices += 1;
    const audio = new Audio();
    audio.src = "./DowntownLA.mp3";
    audio.autoplay = true;
    audio.preload = "auto";

    const audioSourceNode = audioCtxRef.current.createMediaElementSource(audio);
    const gainNode = audioCtxRef.current.createGain();

    gainNode.gain.setValueAtTime(1, audioCtxRef.current.currentTime);

    audioSourceNode.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    setAllAudios((audios) => audios.concat(audio));

    setAllAudios((audios) => {
      const all = audios.concat(audio);
      let av = 2 / audios.length || 1;
      av = Math.min(Math.max(Number.isFinite(av) ? av * 1.5 : 1, 0), 1);
      all.forEach((elm) => {
        elm.volume = av;
      });
      return all;
    });
  }, [masterGainRef.current, audioCtxRef.current]);

  useEffect(() => {
    if (!window.confirm("Start?")) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(
        1,
        audioCtxRef.current.currentTime
      ); // Full volume

      // Connect masterGain to the destination
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }

    const interval = setInterval(addAudio, 2000);
    return () => clearInterval(interval);
  }, []);

  // TODO: use a mesh to display the current audio output as a painting by just spreading them and showing as black and white noise eventuall going in an all noise effect
  return (
    <>
      {allAudios.map((audio, index) => (
        <Box position={[0, 0, index * 1.2]} />
      ))}
    </>
    // <instancedMesh ref={meshRef} args={instanceArgs as any}>
    //   <meshStandardMaterial />
    // </instancedMesh>
  );
};

export default Main;
