container.transaction(async (conn)=> {
    conn.select('MEGA SQL')
    // .... обработка
})

container.transaction(async (conn)=>{
    let user = await User.find(conn, req.id) //select from USER

    user.name= req.body.name
    // ...

    await user.save() // update USER where id=:id
})
