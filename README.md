## Description

Websockets on Stack Exchange provide live updates on a page - for example, showing there are new notifications, or new answers, or new comments, etc. 

These are unreliable in some cases. If the websocket dies, no live updates would show up. If you experience this, try this userscript. It will simulate activity through the websocket by sending a periodic ping. This can be enough to protect from a disconnect.


### Known issues

It is not a silver bullet - there could be firewall or a network device somewhere that forces the disconnect despite there being activity.

## Configuration

There is limited configuration available. At this moment it requires setting a value in local storage.

### Log level

Allows or suppresses logging from the script. Useful for debugging only.

#### How to set

```lang-javascript
localStorage.setItem("WebSocketDefibrilator:log_level", JSON.stringify("OFF"));
```
or
```lang-javascript
localStorage.setItem("WebSocketDefibrilator:log_level", JSON.stringify("ERROR"));
```
or
```lang-javascript
localStorage.setItem("WebSocketDefibrilator:log_level", JSON.stringify("WARNING"));
```
etc.


#### Possible values

- `OFF` - no logging. This is the default
- `ERROR`
- `WARNING`
- `INFO`
- `LOG`
- `DEBUG`
- `TRACE`
- `ALL` - effectively the same as TRACE as it enables everything

Setting any of the values means it and previous values are enabled. So, setting `DEBUG` also enables `LOG`, `INFO`, `WARNING`, and `ERROR`.


### Ping interval

The number of seconds between sending a ping through all websockets on the page. 

#### How to set

```lang-javascript
localStorage.setItem("WebSocketDefibrilator:ping_interval_in_seconds", 10);
```

#### Possible values

Any number. Default is `10`. Negative number or `0` effectively mean "do not wait between pings" but pings will still be not be sent faster than every 1 second.
