
    Actions = [
        //actionnums
    ]

    //actions

    //actioncond


    params = []
    async chooseAction(choice, p)
    {
        switch(choice)
        {
            //action cases
        }
        
        
    }
    async isActionLegal(choice, p)
    {
        switch(choice)
        {
            //condition cases
            
        }
        
        return false;
    }

    async considerations(choice)
    {
        
        switch(choice)
        {
            //considerations cases
        }
        
        return [];
    }
    async generateChoices()
    {
        this.params = []
        let choices =[]
        
        for(let i = 0;i<this.Actions.length;i++)
        {
            let gcCond = await this.considerations(i);

            if( gcCond.length == 0)
            {
                if(await this.isActionLegal(this.Actions[i], []))
                {
                    choices.push(this.Actions[i])
                    this.params.push([])
                }
            }
            else
            {
                
                for(let j = 0;j<await this.considerations(i).length;j++)
                {
                    
                    
                    if(await this.isActionLegal(this.Actions[i], await this.considerations(i)[j]))
                    {
                        choices.push(this.Actions[i])
                        this.params.push(await this.considerations(i)[j])

                    }
                }
            }
        }
        
        return choices
    }