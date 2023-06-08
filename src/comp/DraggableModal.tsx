import React, {useMemo, useState, useCallback, useEffect, PropsWithChildren, useRef} from 'react';
import {Modal} from '@mui/material';
import type {ModalProps} from '@mui/material';
import Draggable from 'react-draggable';

interface Position {
    x: number;
    y: number;
}

const DraggableModal = (props: ModalProps & { handleBackDropClick? : () => void, children: PropsWithChildren, isdraggable?: 'true' | 'false' }) => {
    //
    const {isdraggable = 'false'} = props;
    const draggableRef = useRef<HTMLElement>(null);

    const [isResized, setIsResized] = useState<boolean>(false);
    const [clientXy, setClientXy] = useState<Position>({x: 0, y: 0});
    const [windowXy, setWindowXy] = useState<Position>({x: 0, y: 0});

    const modalPositionX = useMemo(() => clientXy.x ? (windowXy.x / 2 - clientXy.x / 2) : 0, [windowXy.x, clientXy.x]);
    const modalPositionY = useMemo(() => clientXy.y ? (windowXy.y / 2 - clientXy.y / 2) : 0, [windowXy.y, clientXy.y]);

    const [position, setPosition] = useState<Position>({x: modalPositionX, y: modalPositionY});

    useEffect(() => {
        const modalElement = document.querySelector<HTMLElement>('.modal-outer');
        if (modalElement) {
            if(position.x !== 0 && position.y !== 0) modalElement.style.visibility = 'visible';
        }
    } ,[modalPositionX, modalPositionY]);

    const getClientXy = useCallback(() => {
        if(draggableRef.current) {
            setClientXy({
                x: draggableRef.current.clientWidth,
                y: draggableRef.current.clientHeight
            })
        }
    }, [isResized]);

    const getWindowXy = useCallback(() => {
        if(draggableRef.current) {
            setWindowXy({
                x: window.innerWidth,
                y: window.innerHeight
            })
        }
    }, [isResized]);

    const initPosition = useCallback(() => {
        setPosition({
            x: modalPositionX,
            y: modalPositionY,
        })
    }, [modalPositionX, modalPositionY]);

    useEffect(() => {
        getClientXy();
        getWindowXy();
    }, [isResized, draggableRef.current]);

    useEffect(() => {
        initPosition();
    }, [modalPositionX, modalPositionY]);

    useEffect(() => {
        window.onresize = () => setIsResized(!isResized);
    }, [isResized]);

    useEffect(() => {
        return () => {
            setIsResized(false);
            setClientXy({x: 0, y: 0});
            setWindowXy({x: 0, y: 0});
        }
    }, []);

    const rootElement = useMemo(() => document.getElementById('root'), [])
    
    useEffect(() => {
        if(props.open && isdraggable) {
            if(rootElement) rootElement.style.pointerEvents = 'none';
        } else {
            if(rootElement) rootElement.style.pointerEvents = 'auto';
        }
        return () => {
            if(rootElement) rootElement.style.pointerEvents = 'auto';
        }
    }, [props.open, isdraggable]);

    return (
        <>
        {
            isdraggable === 'true' ? 
            <Draggable
            handle='.ui-draggable-handle'
            position={{
                x: position.x < -clientXy.x + 40 ? -clientXy.x + 50 : position.x > windowXy.x - 40 ? windowXy.x - 50: position.x,
                y: position.y < 0 ? 0 : position.y > windowXy.y - 40 ? windowXy.y - 50 : position.y
            }}
            onStop={() => {
                if(draggableRef.current) {
                    setPosition({
                        x: draggableRef.current.getBoundingClientRect().x,
                        y: draggableRef.current.getBoundingClientRect().y,
                    })
                }
            }}
            >
                <Modal
                {...props}
                ref={draggableRef}
                style={{visibility: position.x === 0 ? 'hidden' : 'visible'}}
                className={`${props.className} backdrop-transparent`}
                disableEscapeKeyDown={props.disableEscapeKeyDown === undefined ? true : props.disableEscapeKeyDown}
                onClose={(event, reason) => {
                    if(reason && reason == 'backdropClick') {
                        if(props.handleBackDropClick !== undefined) {
                            props.handleBackDropClick();
                            return;
                        } else {
                            return;
                        }
                    }
                    if(props.onClose) {
                        props.onClose(event, reason);
                    }
                }}
                >
                    {props.children}
                </Modal>
            </Draggable>
              :
              <Modal
                {...props}
                disableEscapeKeyDown={props.disableEscapeKeyDown === undefined ? true : props.disableEscapeKeyDown}
                onClose={(event, reason) => {
                    if(reason && reason == 'backdropClick') {
                        if(props.handleBackDropClick !== undefined) {
                            props.handleBackDropClick();
                            return;
                        } else {
                            return;
                        }
                    }
                    if(props.onClose) {
                        props.onClose(event, reason);
                    }
                }}
              >
                  {props.children}

              </Modal>
        }
        </>
    )
}
