import { useState, useEffect } from 'react'
import { postRequestToServer, jsonPostRequestToServer } from '../../funcs/funcs';

function Fileprocessing() {

    const [inputFilesOnServer, setInputFilesOnServer] = useState([])

    const [selectedInputFilesOnServer, setSelectedInputFilesOnServer] = useState([]);

    const [lockedCoverOn, setLockedCoverOn] = useState(false)

    function uploadFile() {

        let input = document.querySelector('input[type="file"][name="uploaded_file"]')

        if (input.value) {

            let data = new FormData()
            data.append('uploaded_file', input.files[0])

            setLockedCoverOn(true)

            postRequestToServer('/upload_file', data, () => { }, () => {
                input.value = null
                getFilesNamesOfInputFilesDirectory()
            }, () => {
                setLockedCoverOn(false)
            })
        }
        else {
            alert("Необходимо выбрать файл!");
        }
    }

    function getFilesNamesOfInputFilesDirectory() {

        jsonPostRequestToServer('/commands', {
            'command': 'get_files_names_of_input_files_directory'
        }, () => {

        }, (jsonResult) => {
            setInputFilesOnServer(jsonResult ? jsonResult : [])
            setSelectedInputFilesOnServer([])
        })
    }

    function removeFilesFromInputFilesFolder() {

        jsonPostRequestToServer('/commands', {
            'command': 'remove_files_from_input_files_directory',
            'names': selectedInputFilesOnServer
        }, () => {
            setLockedCoverOn(true)
        }, () => {
            getFilesNamesOfInputFilesDirectory()
        }, () => {
            setLockedCoverOn(false)
        })
    }

    function clearAllTablesInDatabase() {

        jsonPostRequestToServer('/commands', {
            'command': 'clear_all_tables_in_datebase'
        }, () => {
            setLockedCoverOn(true)
        }, () => {
            getFilesNamesOfInputFilesDirectory()
        }, () => {
            setLockedCoverOn(false)
        })
    }

    function writeExcelFilesToDataBaseFromInputFilesFolder() {

        jsonPostRequestToServer('/commands', {
            'command': 'write_excel_files_to_database_from_input_files_directory',
            'names': selectedInputFilesOnServer
        }, () => {
            setLockedCoverOn(true)
        }, (jsonResponse) => {
            alert('В базу данных записаны файлы:\n' + jsonResponse.writed_files)
            // getFilesNamesOfInputFilesDirectory()
        }, () => {
            setLockedCoverOn(false)
        })
    }

    useEffect(() => {
        getFilesNamesOfInputFilesDirectory()
    }, [])

    return (
        <>
            <div className='locked-cover' hidden={!lockedCoverOn}></div>
            <div className='fieldset'>
                <input type="file" name="uploaded_file" />
                <button onClick={uploadFile}>Загрузить файл на сервер</button>
            </div>
            <div className='fieldset'>
                <div style={{ marginBottom: '20px' }}>
                    <div className='files-list'>
                        <select className='file-list__select' multiple={true} value={selectedInputFilesOnServer} onChange={(e) => {
                            const options = [
                                ...e.target.selectedOptions,
                            ];
                            const values = options.map(
                                (option) => option.value
                            );
                            setSelectedInputFilesOnServer(values);
                        }}>
                            {inputFilesOnServer.map(fileName => (
                                <option key={'opt_' + fileName} value={fileName}>{fileName}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <button onClick={writeExcelFilesToDataBaseFromInputFilesFolder}>Записать выбранные файлы в базу данных</button>
                </div>
                <div>
                    <button onClick={removeFilesFromInputFilesFolder}>Удалить выбранные файлы с сервера</button>
                </div>
            </div>
            <div style={{ position: 'absolute', right: '30px', bottom: '30px', opacity: '0.6', fontSize: '0.7em' }}>
                <button onClick={() => {
                    if (window.confirm('Вы действительно хотите удалить все данные из базы?')) clearAllTablesInDatabase()
                }}>Очистить базу</button>
            </div>
        </>
    )
}

export default Fileprocessing;